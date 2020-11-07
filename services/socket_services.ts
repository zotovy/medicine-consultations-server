import server from "../server";
import consultation_services from "./consultation_services";

class SocketServices {
    constructor() {
        server.io.on("connection", async (socket) => {
            console.log("USER CONNECTED");

            await consultation_services
                .connect(socket)
                .then(({ room, uid }) => {
                    server.io.to(socket.id).emit("success");
                })
                .catch((e) => {
                    console.error(e);
                    server.io.to(socket.id).emit("error", e);
                });
        });
    }
}

export default SocketServices;
