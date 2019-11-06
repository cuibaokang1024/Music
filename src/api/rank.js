import {commonParams} from './config'
import axios from 'axios'
const debug = process.env.NODE_ENV !== 'production'
export function getTopList (disstid) {
  const url = debug ? '/api/getTopList' : 'http://39.96.195.160/music/api/getTopList'
  const data = Object.assign({}, commonParams, {
    g_tk: '5381',
    uin: '0',
    format: 'json',
    inCharset: 'utf-8',
    outCharset: 'utf-8',
    notice: '0',
    platform: 'h5',
    needNewCode: '1',
    _: 1547708809229
  })
  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
export function getMusicList (topid) {
  const url = debug ? '/api/getMusicList' : 'http://39.96.195.160/music/api/getMusicList'
  const data = Object.assign({}, commonParams, {
    g_tk: '5381',
    uin: '0',
    format: 'json',
    inCharset: 'utf-8',
    outCharset: 'utf-8',
    notice: '0',
    platform: 'h5',
    needNewCode: '1',
    tpl: '3',
    page: 'detail',
    type: 'top',
    topid: topid,
    _: 1547773011306
  })
  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
