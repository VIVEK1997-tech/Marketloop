import { exec } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const port = Number(process.env.PORT || 5000);

const run = (command) =>
  new Promise((resolve, reject) => {
    exec(command, { windowsHide: true }, (error, stdout) => {
      if (error && !stdout) {
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });

const findPidsOnPort = async (targetPort) => {
  const output = await run(`netstat -ano | findstr :${targetPort}`);
  return Array.from(
    new Set(
      output
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((line) => line.includes(`:${targetPort}`) && line.includes('LISTENING'))
        .map((line) => line.split(/\s+/).at(-1))
        .filter(Boolean)
    )
  );
};

const killPid = async (pid) => {
  await run(`taskkill /PID ${pid} /F`);
};

try {
  const pids = await findPidsOnPort(port);

  if (!pids.length) {
    console.log(`Port ${port} is free.`);
    process.exit(0);
  }

  for (const pid of pids) {
    await killPid(pid);
    console.log(`Stopped process ${pid} on port ${port}.`);
  }
} catch (error) {
  console.log(`Could not auto-free port ${port}. ${error.message}`);
}
