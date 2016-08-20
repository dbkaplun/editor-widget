#!/usr/bin/env babel-node

import test from 'tape'
import React, {Component} from 'react'
import {render} from 'react-blessed'
import fs from 'fs'
import path from 'path'

import util from 'base-widget/dist/test/util'
import {Editor} from '..'

class EditorTest extends Component {
  render () { return <Editor ref="editor" /> }
}

test("Editor", t => {
  var editor = render(<EditorTest />, util.createScreen()).refs.editor

  t.test(".open", st => {
    st.test("should throw EACCES for a file with perms 000", sst => {
      sst.plan(1)

      var perms000File = path.resolve(__dirname, 'fixtures/perms-000')

      // can't be checked in with 000 perms
      var originalPerms = (fs.statSync(perms000File).mode.toString(8).match(/[0-7]{3}$/) || [])[0] || '644'
      fs.chmodSync(perms000File, '000')

      editor.open(perms000File)
        .then(() => { sst.ok(false) })
        .catch(err => { sst.equal(err.code, 'EACCES') })
        .finally(() => { fs.chmodSync(perms000File, originalPerms) })
        .done()
    })
  })

  t.on('end', () => {
    Editor.highlightClient.done(client => {
      client.dontRespawn = true
      editor.refs.root.detach()
    })
  })
})
