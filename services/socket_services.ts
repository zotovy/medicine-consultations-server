import { io } from "../server";

class SocketServices {
    constructor() {
        io.on("connection", (socket) => {
            console.log(socket);
        });
    }
}

export default SocketServices;
