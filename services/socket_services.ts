import { io } from "../server";
import consultation_services from "./consultation_services";

class SocketServices {
    constructor() {
        io.on("connection", async (socket) => {
            await consultation_services
                .connect(socket)
                .then(() => io.to(socket.id).emit("success"))
                .catch((e) => {
                    io.to(socket.id).emit("error", e);
                });
        });
    }
}

export default SocketServices;
