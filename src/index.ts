import { spawn, ChildProcess } from "child_process";
import { platform } from "os";
import { watchFile, unwatchFile, readFileSync } from "fs";
import path from "path";
import "./global"

const isTypescript = __filename.endsWith(".ts")
let running: boolean = false;

function run(file: string): void {
  if (running) return;
  running = true;
  const args: string[] = [path.join(__dirname,file),...process.argv.slice(2)]
  const p: ChildProcess = spawn(process.argv[0], args, {
    stdio: ["inherit", "inherit", "inherit", "ipc"]
  })
  p.on("message",(msg: string)=>{
    switch (msg) {
      case "reset": {
        platform() === "win32" ? p.kill("SIGINT") : p.kill();
        running = false;
        run.apply(this, arguments);
      }
      break;
      case "uptime": {
        p.send(process.uptime());
      }
      break;
    }
  });
  p.on("exit", (code: number) => {
    running = false;
    console.error("Exited with code:", code);
    if(code === 0) return;
    watchFile(args[0], () => {
      console.log(file)
      if (isTypescript ? !file.endsWith(".ts") : !file.endsWith(".js")) return
      unwatchFile(args[0]);
      run(file);
    });
  });
}

run("nb" + (isTypescript ? ".ts":".js"))