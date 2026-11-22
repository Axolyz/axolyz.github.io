import { readFile } from "node:fs/promises";

const { sources } = JSON.parse(await readFile(new URL("../theme-sources.json", import.meta.url), "utf8"));

async function json(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/vnd.github+json" },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

const results = await Promise.allSettled(sources.map(async (source) => {
  const latest = await json(`https://api.github.com/repos/${source.repository}/commits/${source.branch}`);
  const lines = [`${source.name}  ${latest.sha === source.commit ? "已跟上记录版本" : "有新提交"}`];
  if (source.package) {
    const release = await json(`https://registry.npmjs.org/${source.package}/latest`);
    lines.push(`  npm ${source.version} → ${release.version}`);
  }
  lines.push(`  https://github.com/${source.repository}/compare/${source.commit}...${latest.sha}`);
  return lines.join("\n");
}));

for (let index = 0; index < results.length; index++) {
  const result = results[index];
  if (result.status === "fulfilled") console.log(result.value);
  else {
    console.error(`${sources[index].name} 检查失败  ${result.reason.message}`);
    process.exitCode = 1;
  }
}
