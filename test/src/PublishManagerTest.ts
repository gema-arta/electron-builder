import { createTargets, Platform } from "electron-builder"
import * as path from "path"
import { assertThat } from "./helpers/fileAssert"
import { app, checkDirContents } from "./helpers/packTester"

test.ifDevOrLinuxCi("generic, github and spaces", app({
  targets: Platform.LINUX.createTarget(),
  config: {
    generateUpdatesFilesForAllChannels: true,
    publish: [
      {
        provider: "generic",
        url: "https://example.com/downloads"
      },
      {
        provider: "github",
        repo: "foo/foo"
      },
      {
        provider: "spaces",
        name: "mySpaceName",
        region: "nyc3"
      },
    ]
  },
}))

// otherwise test "os macro" always failed for pull requests
process.env.PUBLISH_FOR_PULL_REQUEST = "true"

test.ifAll.ifNotWindows("os macro", app({
  targets: createTargets([Platform.LINUX, Platform.MAC], "zip"),
  config: {
    publish: {
      provider: "s3",
      bucket: "my bucket",
      // tslint:disable-next-line:no-invalid-template-strings
      path: "${channel}/${os}"
    },
  },
}, {
  publish: "always",
  projectDirCreated: async projectDir => {
    process.env.__TEST_S3_PUBLISHER__ = path.join(projectDir, "dist/s3")
  },
  packed: async context => {
    const dir = path.join(context.projectDir, "dist/s3")
    await assertThat(dir).isDirectory()
    await checkDirContents(dir)
  }
}))