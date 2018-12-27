import Taro, { Component } from '@tarojs/taro'
import { AtTextarea, AtImagePicker, AtButton } from 'taro-ui'
import { View, Picker, Text } from '@tarojs/components'
import { getReviewTime, getPercentage } from '../../utils/forget'
import './review-task.less'
class ReviewTask extends Component {
  config = {
    navigationBarTitleText: 'New Task',
  }
  constructor() {
    super(...arguments)
    this.state = { currentTaskIndex: 0, updateTime: [], context: '', files: null, editEnable: false, taskList: [] }
  }

  componentWillReceiveProps(nextProps) {}

  componentWillUnmount() {}
  componentDidMount() {
    let taskList = Taro.getStorageSync('taskList')
    taskList = taskList ? JSON.parse(taskList) : []
    console.log(this.$router.params)
    const currentTask = taskList.find((item, index) => {
      if (+item.timestamp === +this.$router.params.timestamp) {
        this.setState({ currentTaskIndex: index })
        return true
      } else {
        return false
      }
    })
    this.setState(
      {
        updateTime: currentTask.updateTime,
        currentTask: currentTask,
        context: currentTask.context,
        files: currentTask.fileList,
        taskList: taskList,
      },
      () => {
        console.log(currentTask)
      }
    )
  }

  componentDidShow() {}
  componentDidHide() {}
  handlecontextChange(event) {
    this.setState({ context: event.target.value })
  }
  onFilesChange(value) {
    this.setState({ files: value })
  }

  onFilesFail() {}
  onImageClick(e) {
    let _arr = []
    this.state.files.forEach(item => {
      _arr.push(item.url)
    })
    Taro.previewImage({ current: this.state.files[e].url, urls: _arr })
  }
  handleSaveTask() {
    let currentTask = this.state.currentTask
    const timestamp = Date.now()
    currentTask.updateTime.push(timestamp)
    currentTask.fileList = this.state.files
    currentTask.context = this.state.context
    currentTask.percentage = getPercentage(timestamp)

    let saveTaskList = JSON.parse(Taro.getStorageSync('taskList'))

    if (currentTask.updateTime.length >= 4) {
      saveTaskList.splice(this.state.currentTaskIndex, 1)
    } else {
      saveTaskList[this.state.currentTaskIndex] = currentTask
    }
    console.log(saveTaskList)
    try {
      Taro.setStorageSync('taskList', JSON.stringify(saveTaskList))
      Taro.redirectTo({ url: '/pages/index/index' })
    } catch (e) {
      // Do something when catch error
    }
  }
  render() {
    const { updateTime, context, files } = this.state
    return (
      <View className="container">
        <View>
          <View className="at-article__h3">任务简述</View>
          <AtTextarea
            className="AtTextarea"
            value={context}
            onChange={this.handlecontextChange.bind(this)}
            autoFocus
            textOverflowForbidden={false}
            count
            height="500"
            maxLength="1000"
            showConfirmBar
            placeholder="开始记录吧"
          />
        </View>
        <View>
          <View className="at-article__h3">添加照片(可选)</View>
          <AtImagePicker
            multiple
            mode="aspectFit"
            files={files}
            onChange={this.onFilesChange.bind(this)}
            onFail={this.onFilesFail.bind(this)}
            onImageClick={this.onImageClick.bind(this)}
          />
        </View>
        <AtButton onClick={this.handleSaveTask} className="saveTaskBtn" size="normal">
          {`打卡(${updateTime.length}/4)`}
        </AtButton>
      </View>
    )
  }
}

export default ReviewTask
