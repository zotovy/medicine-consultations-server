import server from "../server";
import consultation_services from "./consultation_services";

class SocketServices {
    constructor() {
        server.io.on("connection", async (socket) => {
            await consultation_services
                .connect(socket)
                .then(() => {
                    server.io.to(socket.id).emit("success");
                })
                .catch((e) => {
                    server.io.to(socket.id).emit("error", e);
                });
        });
    }
}

export default SocketServices;
