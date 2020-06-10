const main = require("./index")

process.on("SIGINT", () => {
    console.log("Recibida señal de detención.");
    process.exit(1);
});

main.call(this);
