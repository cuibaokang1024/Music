import {commonParams} from './config'
import axios from 'axios'
const debug = process.env.NODE_ENV !== 'production'
export function getHotKey () {
  const url = debug ? '/api/getHotKey' : 'http://47.105.93.204/music/api/getHotKey'
  const data = Object.assign({}, commonParams, {
    _: '1551421614117',
    g_tk: '5381',
    uin: '0',
    format: 'json',
    inCharset: 'utf-8',
    outCharset: 'utf-8',
    notice: '0',
    platform: 'h5',
    needNewCode: '1'
  })
  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
export function search (query, page, zhida, perpage) {
  const url = debug ? '/api/search' : 'http://47.105.93.204/music/api/search'
  const data = Object.assign({}, commonParams, {
    _: '1551423204972',
    uin: '0',
    notice: '0',
    platform: 'h5',
    needNewCode: '1',
    w: query,
    zhidaqu: '1',
    catZhida: zhida ? 1 : 0,
    t: '0',
    flag: '1',
    ie: 'utf-8',
    sem: '1',
    aggr: '0',
    perpage: perpage,
    n: perpage,
    p: page,
    remoteplace: 'txt.mqq.all'
  })
  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
