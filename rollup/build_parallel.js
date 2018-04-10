let cpus = require('os').cpus();
const { spawn, fork } = require('child_process');

let total_cpus = cpus.length;
let processes = [];

for (let cpu in cpus) {
    let process = fork('rollup/build.js', [cpu, total_cpus], { stdio: 'inherit' });
    // let process = spawn('node', ['rollup/build.js', cpu, total_cpus], { stdio: 'inherit' });
}
