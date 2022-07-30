import fs from "fs/promises";
import { getPagesConfig } from "./index";
import path from "path";
import {transform} from '@babel/core'

// @ts-ignore
import transformModulesCommonjs from "@babel/plugin-transform-modules-commonjs"

async function generate() {
    const { code } = await getPagesConfig()
	const dir = path.resolve(__dirname, '../', '.generate')
	const cjs = transform(code, {
		plugins: [transformModulesCommonjs],
	})

	await fs.mkdir(dir, { recursive: true })
	await fs.writeFile(path.join(dir, 'data.js'), cjs?.code || "", {encoding: 'utf-8'})
}

generate()