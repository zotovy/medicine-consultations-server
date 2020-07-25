import logger from "./logger";

console.log("\n\n");

logger.clear();
logger.e("123");
logger.w("123");
logger.i("123");

try {
    const a = [][1]["hey"];
} catch (e) {
    logger.e("error", e.stack);
}
