<template>
    <div class="player" v-show="playlist.length>0">
      <transition name="normal"
                  @enter="enter"
                  @after-enter="afterEnter"
                  @leave="leave"
                  @after-leave="afterLeave">
        <div class="normal-player" v-show="fullScreen">
          <div class="background">
            <img width="100%" height="100%" :src="currentSong.image" alt="">
          </div>
          <div class="top">
            <div class="back" @click="back">
              <i class="icon-back"></i>
            </div>
            <h1 class="title" v-html="currentSong.name"></h1>
            <h2 class="subtitle" v-html="currentSong.singer"></h2>
          </div>
          <div class="middle"
               @touchstart="middleTouchStart"
               @touchmove="middleTouchMove"
               @touchend="middleTouchEnd">
            <div class="middle-l" ref="middlel">
              <div class="cd-wrapper" ref="cdWrapper">
                <div class="cd" ref="imageWrapper">
                  <img ref="image" :class="cdCls" class="image" :src="currentSong.image" alt="">
                </div>
              </div>
              <div class="playing-lyric-wrapper">
                <div class="playing-lyric">{{playingLyric}}</div>
              </div>
            </div>
            <scroll :data="currentLyric && currentLyric.lines" class="middle-r" ref="lyricList">
              <div class="lyric-wrapper">
                <div v-if="currentLyric">
                  <p ref="lyricLine" :class="{'current': currentLineNum === index}" class="text" v-for="(line, index) in currentLyric.lines" :key="index">{{line.txt}}</p>
                </div>
              </div>
            </scroll>
          </div>
          <div class="bottom">
            <div class="dot-wrapper">
              <div class="dot" :class="{'active':currentShow === 'cd'}"></div>
              <div class="dot" :class="{'active':currentShow === 'lyric'}"></div>
            </div>
            <div class="progress-wrapper">
              <span class="time time-l">{{format(currentTime)}}</span>
              <div class="progress-bar-wrapper">
                <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
              </div>
              <span class="time time-r">{{format(currentSong.duration)}}</span>
            </div>
            <div class="operators">
              <div class="icon i-left">
                <i :class="iconMode" @click="changeMode"></i>
              </div>
              <div class="icon i-left" :class="disableCls">
                <i @click="prev" class="icon-prev"></i>
              </div>
              <div class="icon i-center" :class="disableCls">
                <i @click="togglePlaying" :class="playIcon"></i>
              </div>
              <div class="icon i-right" :class="disableCls">
                <i @click="next" class="icon-next"></i>
              </div>
              <div class="icon i-right">
                <i class="icon" @click="toggleFavorite(currentSong)" :class="getFavoriteIcon(currentSong)"></i>
              </div>
            </div>
          </div>
        </div>
      </transition>
      <transition name="mini">
        <div class="mini-player" v-show="!fullScreen" @click="open">
          <div class="icon">
            <div class="imgWrapper" ref="miniWrapper">
              <img ref="miniImage" :class="cdCls" width="40" height="40" :src="currentSong.image">
            </div>
          </div>
          <div class="text">
            <h2 class="name" v-html="currentSong.name"></h2>
            <p class="desc" v-html="currentSong.singer"></p>
          </div>
          <div class="control">
            <progress-circle :radius="radius" :percent="percent">
              <i @click.stop="togglePlaying" :class="miniIcon" class="icon-mini"></i>
            </progress-circle>
          </div>
          <div class="control" @click.stop="showPlaylist">
            <i class="icon-playlist"></i>
          </div>
        </div>
      </transition>
      <playlist ref="playlist"></playlist>
      <audio @ended="end" @timeupdate="updateTime" ref="audio" @canplay="ready" @error="error" :src="currentSong.url"></audio>
    </div>
</template>

<script type="text/ecmascript-6">
import {mapGetters, mapMutations, mapActions} from 'vuex'
import animations from 'create-keyframe-animation'
import ProgressBar from 'base/progress-bar/progress-bar'
import ProgressCircle from 'base/progress-circle/progress-circle'
import {playMode} from 'common/js/config.js'

import Lyric from 'lyric-parser'
import Scroll from 'base/scroll/scroll'
import Playlist from 'components/playlist/playlist'
import {playerMixin} from 'common/js/mixin'
export default {
  mixins: [playerMixin],
  data () {
    return {
      songReady: false,
      currentTime: 0,
      flash: false,
      radius: 32,
      currentLyric: null,
      currentLineNum: 0,
      currentShow: 'cd',
      playingLyric: ''
    }
  },
  computed: {
    disableCls () {
      return this.songReady ? '' : 'disable'
    },
    playIcon () {
      return this.playing ? 'icon-pause' : 'icon-play'
    },
    miniIcon () {
      return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
    },
    cdCls () {
      return this.playing ? 'play' : ''
    },
    percent () {
      return this.currentTime / this.currentSong.duration
    },
    ...mapGetters([
      'fullScreen',
      'playing',
      'currentIndex'
    ])
  },
  created () {
    this.touch = {}
  },
  methods: {
    ...mapMutations({
      setFullScreen: 'SET_FULL_SCREEN'
    }),
    ...mapActions([
      'savePlayHistory'
    ]),
    end () {
      this.currentTime = 0
      if (this.mode === playMode.loop) {
        this.loop()
      } else {
        this.next()
      }
    },
    loop () {
      this.$refs.audio.currentTime = 0
      this.$refs.audio.play()
      if (this.currentLyric) {
        this.currentLyric.seek(0)
      }
    },
    error () {
      this.songReady = true
    },
    ready () {
      this.songReady = true
      this.savePlayHistory(this.currentSong)
    },
    next () {
      if (!this.songReady) {
        return
      }
      if (this.playlist.length === 1) {
        this.loop()
      }
      let index = this.currentIndex + 1
      if (index === this.playlist.length) {
        index = 0
      }
      this.setCurrentIndex(index)
      if (!this.playing) {
        this.togglePlaying()
      }
      this.songReady = false
    },
    prev () {
      if (!this.songReady) {
        return
      }
      if (this.playlist.length === 1) {
        this.loop()
      }
      let index = this.currentIndex - 1
      if (index === -1) {
        index = this.playlist.length - 1
      }
      this.setCurrentIndex(index)
      if (!this.playing) {
        this.togglePlaying()
      }
      this.songReady = false
    },
    back () {
      this.setFullScreen(false)
    },
    open () {
      this.setFullScreen(true)
    },
    enter (el, done) {
      const {x, y, scale} = this._getPosAndScale()
      let animation = {
        0: {
          transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
        },
        60: {
          transform: `translate3d(0,0,0) scale(1.1)`
        },
        100: {
          transform: `translate3d(0,0,0) scale(1)`
        }
      }

      animations.registerAnimation({
        name: 'move',
        animation,
        presets: {
          duration: 400,
          easing: 'linear'
        }
      })

      animations.runAnimation(this.$refs.cdWrapper, 'move', done)
    },
    afterEnter () {
      animations.unregisterAnimation('move')
      this.$refs.cdWrapper.style.animation = ''
    },
    leave (el, done) {
      this.$refs.cdWrapper.style.transition = 'all 0.4s'
      const {x, y, scale} = this._getPosAndScale()
      this.$refs.cdWrapper.style.transform = `translate3d(${x}px,${y}px,0) scale(${scale})`
      const timer = setTimeout(done, 400)
      this.$refs.cdWrapper.addEventListener('transitionend', () => {
        clearTimeout(timer)
        done()
      })
    },
    afterLeave () {
      this.$refs.cdWrapper.style.transition = ''
      this.$refs.cdWrapper.style.transform = ''
    },
    _getPosAndScale () {
      const targetWidth = 40
      const paddingLeft = 40
      const paddingBottom = 30
      const paddingTop = 80
      const width = window.innerWidth * 0.8
      const scale = targetWidth / width
      const x = -(window.innerWidth / 2 - paddingLeft)
      const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
      return {
        x,
        y,
        scale
      }
    },
    /**
     * 计算内层Image的transform，并同步到外层容器
     * @param wrapper
     * @param inner
     */
    syncWrapperTransform (wrapper, inner) {
      if (!this.$refs[wrapper]) {
        return
      }
      let imageWrapper = this.$refs[wrapper]
      let image = this.$refs[inner]
      let wTransform = getComputedStyle(imageWrapper)['transform']
      let iTransform = getComputedStyle(image)['transform']
      imageWrapper.style.transform = wTransform === 'none' ? iTransform : iTransform.concat(' ', wTransform)
    },
    togglePlaying () {
      if (!this.songReady) {
        return
      }
      this.setPlayingState(!this.playing)
      if (this.currentLyric) {
        this.currentLyric.togglePlay()
      }
    },
    updateTime (e) {
      this.currentTime = e.target.currentTime
    },
    format (interval) {
      interval = interval | 0
      const minute = interval / 60 | 0
      const second = (interval % 60).toString().padStart(2, '0')
      return `${minute}:${second}`
    },
    onProgressBarChange (percent) {
      const currentTime = this.currentSong.duration * percent
      this.$refs.audio.currentTime = this.currentSong.duration * percent
      if (!this.playing) {
        this.togglePlaying()
      }
      if (this.currentLyric) {
        this.currentLyric.seek(currentTime * 1000)
      }
    },
    getLyric () {
      this.currentSong.getLyric().then((lyric) => {
        this.currentLyric = new Lyric(lyric, this.handleLyric)
        if (this.playing) {
          this.currentLyric.play()
        }
      }).catch(() => {
        this.currentL = null
        this.playingLyric = ''
        this.currentLineNum = '0'
      })
    },
    handleLyric ({lineNum, txt}) {
      this.currentLineNum = lineNum
      if (lineNum > 5) {
        let lineEl = this.$refs.lyricLine[lineNum - 5]
        this.$refs.lyricList.scrollToElement(lineEl, 1000)
      } else {
        this.$refs.lyricList.scrollToElement(0, 0, 1000)
      }
      this.playingLyric = txt
    },
    middleTouchStart (e) {
      this.touch.initiated = true
      const touch = e.touches[0]
      this.touch.startX = touch.pageX
      this.touch.startY = touch.pageY
    },
    middleTouchMove (e) {
      if (!this.touch.initiated) {
        return
      }
      const touch = e.touches[0]
      const deltaX = touch.pageX - this.touch.startX
      const deltaY = touch.pageY - this.touch.startY
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        return ''
      }
      const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
      const offsetwidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
      this.touch.percent = Math.abs(offsetwidth / window.innerWidth)
      this.$refs.lyricList.$el.style.transform = `translate3d(${offsetwidth}px, 0, 0)`
      this.$refs.lyricList.$el.style.transitionDuration = '0ms'
      this.$refs.middlel.style.opacity = 1 - this.touch.percent
      this.$refs.middlel.style.transitionDuration = '0ms'
    },
    middleTouchEnd () {
      let offsetwidth
      let opacity
      if (this.currentShow === 'cd') {
        if (this.touch.percent > 0.1) {
          offsetwidth = -window.innerWidth
          opacity = 0
          this.currentShow = 'lyric'
        } else {
          offsetwidth = 0
        }
      } else {
        if (this.touch.percent < 0.9) {
          offsetwidth = 0
          this.currentShow = 'cd'
          opacity = 1
        } else {
          offsetwidth = -window.innerWidth
          opacity = 0
        }
      }
      this.$refs.lyricList.$el.style.transform = `translate3d(${offsetwidth}px, 0, 0)`
      this.$refs.lyricList.$el.style.transitionDuration = '300ms'
      this.$refs.middlel.style.opacity = opacity
      this.$refs.middlel.style.transitionDuration = '300ms'
    },
    showPlaylist () {
      this.$refs.playlist.show()
    }
  },
  watch: {
    currentSong (newSong, oldSong) {
      if (!newSong.id || !newSong.url || newSong.id === oldSong.id) {
        return
      }
      if (this.currentLyric) {
        this.currentLyric.stop()
      }
      this.$nextTick(() => {
        this.$refs.audio.play()
        this.getLyric()
      })
    },
    playing (newPlaying) {
      this.$nextTick(() => {
        newPlaying ? this.$refs.audio.play() : this.$refs.audio.pause()
      })
      if (!newPlaying) {
        if (this.fullScreen) {
          this.syncWrapperTransform('imageWrapper', 'image')
        } else {
          this.syncWrapperTransform('miniWrapper', 'miniImage')
        }
      }
    }
  },
  components: {
    ProgressBar,
    ProgressCircle,
    Scroll,
    Playlist
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            box-sizing: border-box
            height: 100%
            .cd
              width: 100%
              height: 100%
              border-radius: 50%
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                box-sizing: border-box
                border-radius: 50%
                border: 10px solid rgba(255, 255, 255, 0.1)
              .play
                animation: rotate 20s linear infinite
          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
            .pure-music
              padding-top: 50%
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        height: 40px
        padding: 0 10px 0 20px
        .imgWrapper
          height: 100%
          width: 100%
          img
            border-radius: 50%
            &.play
              animation: rotate 10s linear infinite
            &.pause
              animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>
