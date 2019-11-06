import jsonp from 'common/js/jsonp'
import {commonParams, options} from './config'
import axios from 'axios'
const debug = process.env.NODE_ENV !== 'production'
export function getRecommend () {
  const url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg'
  const data = Object.assign({}, commonParams, {
    platform: 'h5',
    uin: 0,
    needNewCode: 1
  })
  return jsonp(url, data, options)
}
export function getDiscList () {
  const url = debug ? '/api/getDiscList' : 'http://47.105.93.204/music/api/getDiscList'
  const data = Object.assign({}, commonParams, {
    platform: 'yqq',
    hostUin: 0,
    sin: 0,
    ein: 29,
    sortId: 5,
    needNewCode: 0,
    categoryId: 10000000,
    rnd: Math.random(),
    format: 'json'
  })
  return axios.get(url, {params: data}).then((res) => {
    return Promise.resolve(res.data)
  })
}
export function getSingerList () {
  const url = debug ? '/api/getSingerList' : 'http://47.105.93.204/music/api/getSingerList'
  const data = Object.assign({}, commonParams, {
    g_tk: 5381,
    loginUin: 0,
    hostUin: 0,
    format: 'json',
    inCharset: 'utf8',
    outCharset: 'utf-8',
    notice: 0,
    needNewCode: 0,
    platform: 'yqq',
    data: {
      'comm': {'ct': 24, 'cv': 10000},
      'singerList': {'module': 'Music.SingerListServer', 'method': 'get_singer_list', 'param': {'area': -100, 'sex': -100, 'genre': -100, 'index': -100, 'sin': 0, 'cur_page': 1}}
    }
  })
  return axios.get(url, {params: data}).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function getSongList (disstid) {
  const url = debug ? '/api/getCdInfo' : 'http://47.105.93.204/music/api/getCdInfo'
  const data = Object.assign({}, commonParams, {
    disstid,
    type: 1,
    json: 1,
    utf8: 1,
    onlysong: 0,
    platform: 'yqq',
    hostUin: 0,
    needNewCode: 0
  })
  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
