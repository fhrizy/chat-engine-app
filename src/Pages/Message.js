import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { useHistory } from "react-router-dom";
import { socket } from "../socket";
import CircularProgress from "@mui/material/CircularProgress";
import imageCompression from "browser-image-compression";
import ScrollToBottom from "react-scroll-to-bottom";
import axios from "axios";

import Emoji from "../assets/emoji-laughing.svg";
import Mic from "../assets/mic-fill.svg";
import Attach from "../assets/paperclip.svg";
import Send from "../assets/send-fill.svg";
import Docs from "../assets/file-earmark-word-fill.svg";
import Sheet from "../assets/file-earmark-excel-fill.svg";
import Slide from "../assets/file-earmark-ppt-fill.svg";
import PDF from "../assets/file-earmark-pdf-fill.svg";
import Files from "../assets/file-earmark-fill.svg";
import Play from "../assets/play-fill.svg";
import X from "../assets/x-lg.svg";
import "../stylesheets/message.scss";

const Message = ({ room, name, setPreview }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [previewFile, setPreviewFile] = useState();
  const [pagePreview, setPagePreview] = useState();
  const [fileObject, setFileObject] = useState("");
  const [thumbnailImg, setThumbnailImg] = useState();
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);
  const video = useRef();
  let redirect = useHistory();

  /* Function onDrop Item */
  const onDrop = useCallback((acceptedFiles) => {
    var fileName = acceptedFiles[0].name;
    var convertKB = acceptedFiles[0].size / 1024;
    var convertMB = convertKB / 1024;
    var type = acceptedFiles[0].type.split("/")[1];
    var typeImage = `image/${acceptedFiles[0].type.split("/")[1]}`;
    var typeDocs = `application/${acceptedFiles[0].type.split("/")[1]}`;
    var typeVideo = `video/${acceptedFiles[0].type.split("/")[1]}`;

    /* Validation file type */
    if (acceptedFiles[0].type === typeImage) {
      /* Image type file */
      var options = {
        maxSizeMB: 0.1,
        maxWidthOrHeight: 1800,
      };
      setLoadingFile(true);
      /* Image Compression for thumbnail image */
      imageCompression(acceptedFiles[0], options).then((res) => {
        var resConvertKB = res.size / 1024;
        var resConvertMB = resConvertKB / 1024;
        setPreviewFile(
          <>
            <img src={URL.createObjectURL(res)} alt="" />
            <p>{fileName}</p>
            <h4>
              {resConvertKB <= 1024
                ? resConvertKB.toFixed(2) + " KB"
                : resConvertMB.toFixed(2) + " MB"}
            </h4>
          </>
        );
        setLoadingFile(false);
        /* Convert file to arraybuffer */
        new Response(res).arrayBuffer().then((event) => {
          setThumbnailImg(event);
        });
      });
      setFileObject(acceptedFiles[0]);
    } else if (acceptedFiles[0].type === typeDocs) {
      /* document type file */
      var docs = type.split(".")[3];
      setPreviewFile(
        <>
          <div
            id={
              docs === "document"
                ? "docs"
                : docs === "presentation"
                ? "slide"
                : docs === "sheet"
                ? "sheet"
                : type === "msword"
                ? "docs"
                : type === "pdf"
                ? "pdf"
                : type === "octet-stream"
                ? "other"
                : "other"
            }
          >
            <img
              src={
                docs === "document"
                  ? Docs
                  : docs === "presentation"
                  ? Slide
                  : docs === "sheet"
                  ? Sheet
                  : type === "msword"
                  ? Docs
                  : type === "pdf"
                  ? PDF
                  : type === "octet-stream"
                  ? Files
                  : Files
              }
              alt=""
              width="100"
            />
          </div>
          <p>{fileName}</p>
          <h4>
            {convertKB <= 1024
              ? convertKB.toFixed(2) + " KB"
              : convertMB.toFixed(2) + " MB"}
          </h4>
        </>
      );
      setFileObject(acceptedFiles[0]);
    } else if (acceptedFiles[0].type === typeVideo) {
      /* video type file */
      const setFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );
      setPreviewFile(setFiles[0].preview);
      setFileObject(acceptedFiles[0]);
    } else {
      /* undifined type file */
      setPreviewFile(
        <>
          <img src={Files} alt="" width="100" />
          <p>{fileName}</p>
          <h4>
            {convertKB <= 1024
              ? convertKB.toFixed(2) + " KB"
              : convertMB.toFixed(2) + " MB"}
          </h4>
        </>
      );
      setFileObject(acceptedFiles[0]);
    }
    setPagePreview(true);
  }, []);

  /* all Function for Dropzone upload file */
  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
  });

  /* get all history messages */
  useEffect(() => {
    let mounted = true;

    const axiosData = async () => {
      if (room) {
        await axios
          .get(
            `http://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}/api/get-messages`,
            {
              params: {
                roomId: room,
                token: user.token,
              },
            }
          )
          .then((res) => {
            if (mounted) {
              socket.emit("authorize", { token: user.token });
              if (room !== "") {
                const data = {
                  roomId: room,
                };
                socket.emit("join-room", data);
              }
              const history = res.data;
              let messageContents = history.map(function (data) {
                return data.message.messageContent;
              });
              setPagePreview(false);
              setPreviewFile([]);
              setCurrentMessage("");
              setMessageList(messageContents);
            }
          })
          .catch((error) => {
            if (error.request.status === 401) {
              socket.disconnect();
              localStorage.clear();
              redirect.push("/");
              window.location.reload(false);
            }
          });
      }
    };
    axiosData();

    return () => {
      mounted = false;
    };
  }, [room, user.token, redirect]);

  /* set message data */
  const setMessageData = async () => {
    setPagePreview(false);
    setCurrentMessage("");
    if (fileObject !== "") {
      setFileObject("");
      setLoadingMessage(true);
      if (fileObject.type.split("/")[0] === "video") {
        const canvas = document.createElement("canvas");
        canvas.width = video.current.videoWidth;
        canvas.height = video.current.videoHeight;
        canvas
          .getContext("2d")
          .drawImage(
            video.current,
            0,
            0,
            video.current.videoWidth,
            video.current.videoHeight
          );
        fetch(canvas.toDataURL())
          .then((res) => res.blob())
          .then((blob) => {
            const NewFile = new File([blob], "video_thumbnail", {
              type: "image/png",
            });
            var options = {
              maxSizeMB: 0.1,
              maxWidthOrHeight: 1800,
            };
            imageCompression(NewFile, options).then((res) => {
              new Response(res).arrayBuffer().then((event) => {
                const formData = new FormData();
                formData.append("file", fileObject);
                axios
                  .post(
                    `http://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}/api/upload`,
                    formData,
                    {
                      params: {
                        token: user.token,
                      },
                    }
                  )
                  .then((res) => {
                    const data = {
                      type: "media",
                      username: user.username,
                      message: currentMessage ? currentMessage : "",
                      fileId: res.data.fileId,
                      thumbnail: event,
                      timeSent: new Date(),
                    };
                    sendMessageData(data);
                  })
                  .catch((error) => {
                    if (error.request.status === 500) {
                      alert("Files too large!");
                      setLoadingMessage(false);
                    }
                  });
              });
            });
          });
      } else {
        const formData = new FormData();
        formData.append("file", fileObject);
        await axios
          .post(
            `http://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}/api/upload`,
            formData,
            {
              params: {
                token: user.token,
              },
            }
          )
          .then((res) => {
            const data = {
              type: "media",
              username: user.username,
              message: currentMessage ? currentMessage : "",
              fileId: res.data.fileId,
              thumbnail: thumbnailImg,
              timeSent: new Date(),
            };
            sendMessageData(data);
          })
          .catch((error) => {
            if (error.request.status === 500) {
              alert("Files too large!");
              setLoadingMessage(false);
            }
          });
      }
    } else if (currentMessage !== "" && fileObject === "") {
      const data = {
        type: "text",
        username: user.username,
        message: currentMessage ? currentMessage : "",
        fileId: "",
        timeSent: new Date(),
      };
      sendMessageData(data);
    }
  };

  /* Socket Send Realtime New Message */
  const sendMessageData = async (messageData) => {
    await socket.emit("send-message", messageData);
    setPagePreview(false);
    setPreviewFile();
    setThumbnailImg();
    setFileObject("");
    setCurrentMessage("");
  };

  /* Socket Receive Realtime New Message */
  useEffect(() => {
    let mounted = true;

    const socketData = async () => {
      await socket.on("receive-message", (messageData) => {
        if (mounted) {
          setMessageList((list) => [...list, messageData]);
          if (
            messageData.username === user.username &&
            messageData.fileId !== ""
          ) {
            setLoadingMessage(false);
          }
        }
      });
    };
    socketData();

    return () => {
      mounted = false;
    };
  }, [user, thumbnailImg]);

  /* Download file */
  const downloadFile = (fileId) => {
    if (fileId !== "") {
      axios
        .get(
          `http://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}/api/download`,
          {
            params: {
              filename: fileId,
              token: user.token,
            },
          }
        )
        .then((res) => {
          window.open(res.data.url);
        });
    }
  };

  return (
    <div className="message-loader">
      {/* Start Room Chat Page */}
      <div className="message-header">
        <h3>{name}</h3>
      </div>
      {pagePreview === false ? (
        <>
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            <ScrollToBottom className="message-room" ScrollBehavior="smooth">
              {isDragActive ? (
                <div className="file-drag">Add your file</div>
              ) : (
                messageList.map((message, i) => {
                  return (
                    <div
                      className="message-container"
                      key={i}
                      id={user.username === message.username ? "you" : "other"}
                    >
                      <div>
                        <div className="message-content">
                          {!message.fileId ? (
                            ""
                          ) : message.fileId.split(".")[1] === "jpg" ||
                            message.fileId.split(".")[1] === "jpeg" ||
                            message.fileId.split(".")[1] === "png" ? (
                            <img
                              alt="gambar"
                              src={`data:${"image/jpeg"}; base64,${new Buffer(
                                message.thumbnail.data
                              ).toString("base64")}`}
                              onClick={() => setPreview(message.fileId)}
                            />
                          ) : message.fileId.split(".")[1] === "mp4" ||
                            message.fileId.split(".")[1] === "mov" ||
                            message.fileId.split(".")[1] === "avi" ? (
                            <>
                              <div
                                className="video"
                                onClick={() => setPreview(message.fileId)}
                              >
                                <img
                                  className="img1"
                                  src={`data:${"image/png"}; base64,${new Buffer(
                                    message.thumbnail.data
                                  ).toString("base64")}`}
                                  alt="video"
                                />
                                <img className="img2" src={Play} alt="video" />
                              </div>
                              {/* <span>{message.fileId}</span> */}
                            </>
                          ) : (
                            <div
                              className="document"
                              onClick={() => downloadFile(message.fileId)}
                            >
                              <span>{message.fileId}</span>
                              <div
                                id={
                                  message.fileId.split(".")[1] === "pdf"
                                    ? "pdf"
                                    : message.fileId.split(".")[1] === "doc" ||
                                      message.fileId.split(".")[1] === "docx"
                                    ? "docs"
                                    : message.fileId.split(".")[1] === "xls" ||
                                      message.fileId.split(".")[1] === "xlsx"
                                    ? "sheet"
                                    : message.fileId.split(".")[1] === "ppt" ||
                                      message.fileId.split(".")[1] === "pptx"
                                    ? "slide"
                                    : "other"
                                }
                              >
                                <img
                                  src={
                                    message.fileId.split(".")[1] === "pdf"
                                      ? PDF
                                      : message.fileId.split(".")[1] ===
                                          "doc" ||
                                        message.fileId.split(".")[1] === "docx"
                                      ? Docs
                                      : message.fileId.split(".")[1] ===
                                          "xls" ||
                                        message.fileId.split(".")[1] === "xlsx"
                                      ? Sheet
                                      : message.fileId.split(".")[1] ===
                                          "ppt" ||
                                        message.fileId.split(".")[1] === "pptx"
                                      ? Slide
                                      : Files
                                  }
                                  alt="document"
                                />
                              </div>
                            </div>
                          )}
                          <p>{message.message}</p>
                        </div>
                        <div className="message-meta">
                          {/* <p>{message.username}</p> */}
                          <p>
                            {!message.timeReceived
                              ? ""
                              : ((Number(
                                  message.timeReceived
                                    .split("T")[1]
                                    .split(".")[0]
                                    .split(":")[0]
                                ) +
                                  Number(7)) %
                                  Number(24)) +
                                ":" +
                                message.timeReceived
                                  .split("T")[1]
                                  .split(".")[0]
                                  .split(":")[1]}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              {loadingMessage ? (
                <div className="loading">
                  <CircularProgress />
                </div>
              ) : (
                false
              )}
            </ScrollToBottom>
          </div>
          {/* End Room Chat Page */}

          {/* Start Input New Message */}
          <div className="message-send">
            <div className="emoji">
              <img src={Emoji} alt="Emoji" />
            </div>
            <div className="attach" onClick={open}>
              <img src={Attach} alt="Attach" />
            </div>
            <input
              type="text"
              value={currentMessage}
              placeholder="Message"
              onChange={(event) => {
                setCurrentMessage(event.target.value.trimStart());
              }}
              onKeyPress={(event) => {
                event.key === "Enter" && setMessageData();
              }}
              autoFocus
            />
            <div className="send" onClick={setMessageData}>
              <img src={Send} alt="Send" />
            </div>
            <div className="mic">
              <img src={Mic} alt="Mic" />
            </div>
          </div>
          {/* End Input New Message */}
        </>
      ) : pagePreview === true ? (
        <div className="preview">
          <div className="cancel">
            <img
              src={X}
              alt="cancel"
              onClick={() => {
                setPagePreview(false);
                setPreviewFile();
              }}
            />
          </div>
          <div className="file-preview">
            {loadingFile ? (
              <div className="loading">
                <CircularProgress />
              </div>
            ) : fileObject.path.split(".")[1] === "mp4" ? (
              <video
                ref={video}
                width="400"
                height="400"
                src={previewFile}
                controls
              />
            ) : (
              previewFile
            )}
          </div>
          <div className="file-preview-message">
            <input
              type="text"
              value={currentMessage}
              placeholder="Message"
              onChange={(event) => {
                setCurrentMessage(event.target.value);
              }}
              onKeyPress={(event) => {
                event.key === "Enter" && setMessageData();
              }}
              autoFocus
            />
            <div
              className="send"
              onClick={() => {
                setMessageData();
              }}
            >
              <img src={Send} alt="Send" />
            </div>
          </div>
        </div>
      ) : (
        <div className="none">Start Chat</div>
      )}
    </div>
  );
};

export default Message;
