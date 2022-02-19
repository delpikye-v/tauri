const fixtureSetup = require('../fixtures/app-test-setup.js')
const { resolve } = require('path')
const { existsSync, readFileSync, writeFileSync } = require('fs')
const { move } = require('fs-extra')
const cli = require('~/main.js')

const currentDirName = __dirname

describe('[CLI] cli.js template', () => {
  it('init a project and builds it', async () => {
    const cwd = process.cwd()
    const fixturePath = resolve(currentDirName, '../fixtures/empty')
    const tauriFixturePath = resolve(fixturePath, 'src-tauri')
    const outPath = resolve(tauriFixturePath, 'target')
    const cacheOutPath = resolve(fixturePath, 'target')

    fixtureSetup.initJest('empty')

    process.chdir(fixturePath)

    const outExists = existsSync(outPath)
    if (outExists) {
      await move(outPath, cacheOutPath)
    }

    await cli.run(['init', '--directory', process.cwd(), '--force', '--tauri-path', resolve(currentDirName, '../../../../../..'), '--ci'])
      .catch(err => {
        console.error(err)
        throw err
      })

    if (outExists) {
      await move(cacheOutPath, outPath)
    }

    process.chdir(tauriFixturePath)

    const manifestPath = resolve(tauriFixturePath, 'Cargo.toml')
    const manifestFile = readFileSync(manifestPath).toString()
    writeFileSync(manifestPath, `workspace = { }\n${manifestFile}`)

    await cli.run(['build', '--verbose']).catch(err => {
      console.error(err)
      throw err
    })
    process.chdir(cwd)
  })
})
