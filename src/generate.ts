import fs from "fs/promises";
import { getPagesConfig } from "./index";
import path from "path";
import { transform } from '@babel/core'

// @ts-ignore
import preset from '@babel/preset-react'

async function generate() {
    const { code } = await getPagesConfig()
	const js = transform(code, {
		presets: [preset]
	})

	const dirs = [
		path.resolve(__dirname, '../', '.generate'),
		path.resolve(__dirname, '../', 'node_modules', 'next-pages-config', '.generate')
	]

	for (const dir of dirs) {
		await fs.mkdir(dir, { recursive: true })
		await fs.writeFile(path.join(dir, 'data.mjs'), js?.code as string, {encoding: 'utf-8'})
	}
}

generate()