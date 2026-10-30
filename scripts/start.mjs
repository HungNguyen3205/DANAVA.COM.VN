import{spawn}from'node:child_process';
const args=process.argv.slice(2),i=args.indexOf('--port'),port=i>=0?args[i+1]:(process.env.PORT||'3000');
const child=spawn(process.execPath,['server.cjs'],{env:{...process.env,PORT:port},stdio:'inherit'});for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));child.on('exit',code=>process.exit(code??0));
