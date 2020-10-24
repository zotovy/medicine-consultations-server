import { isObject } from "util";
import server from "../server";
import consultation_services from "./consultation_services";

class SocketServices {
    constructor() {
        server.io.on("connection", async (socket) => {
            await consultation_services
                .connect(socket)
                .then(({ room, uid }) => {
                    server.io.to(socket.id).emit("success");

                    socket.on("disconnect", () => {
                        socket.to(room).emit("disconnected", socket.id);
                    });
                })
                .catch((e) => {
                    server.io.to(socket.id).emit("error", e);
                });
        });
    }
}

export default SocketServices;
