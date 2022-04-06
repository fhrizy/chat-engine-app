import io from "socket.io-client";

export const socket = io.connect(`http://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}`);
