import fs from "fs/promises";
import { getPagesConfig } from "./index";
import path from "path";
import { transform } from '@babel/core'

// @ts-ignore
import preset from '@babel/preset-react'

async function generate() {
    const { code } = await getPagesConfig()
	const dir = path.resolve(__dirname, '../', '.generate')
	const js = transform(code, {
		presets: [preset]
	})

	await fs.mkdir(dir, { recursive: true })
	await fs.writeFile(path.join(dir, 'data.js'), js?.code as string, {encoding: 'utf-8'})
}

generate()