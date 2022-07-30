import fs from "fs/promises";
import { getPagesConfig } from "next-pages-config";
import path from "path";

async function generate() {
    const {code} = await getPagesConfig()
	const dir = path.resolve(__dirname, '../', '.generate')

	await fs.mkdir(dir, { recursive: true})
	await fs.writeFile(path.join(dir, 'data.js'), code, {encoding: 'utf-8'})
}

generate()