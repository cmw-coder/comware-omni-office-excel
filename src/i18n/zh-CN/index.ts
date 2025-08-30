export default {
  components: {
    DashboardCards: {
      CompletionCard: {
        labels: {
          title: '补全',
          generate: '生成',
          insertCompletion: '插入补全',
          noData: '编辑文档或单击“生成”以获取补全',
          noNeedToComplete: '无需补全',
        },
      },
    },
    SettingsCards: {
      developer: {
        GeneralCard: {
          labels: {
            title: '通用',
            developerMode: '开发者模式',
          },
        },
        RequestTestCard: {
          labels: {
            title: '请求测试',
            contextPrefix: '上下文前缀',
            contextSuffix: '上下文后缀',
            sendRequest: '发送请求',
          },
        },
      },
      main: {
        AboutCard: {
          labels: {
            title: '关于',
            developerOptions: '开发者选项',
            environment: '环境',
            version: '版本',
          },
          notifications: {
            copySuccess: 'Office 信息已复制到剪贴板',
            copyFailure: '未能将 Office 信息复制到剪贴板',
            developerModeHint: '再点击 {times} 次以启用开发者模式',
            developerModeEnabled: '开发者模式已启用',
          },
        },
        CompletionCard: {
          labels: {
            title: '补全',
            serviceUrl: '服务 URL',
            singleParagraph: '单段落补全',
          },
        },
        GeneralCard: {
          labels: {
            title: '通用',
            language: '语言',
            theme: '加载项主题',
          },
          languages: {
            'zh-CN': '简体中文',
            'en-US': '英语（美国）',
          },
        },
      },
    },
    ThemeButton: {
      labels: {
        toggleTheme: '切换主题',
      },
    },
  },
  layouts: {
    headers: {
      TaskpaneHeader: {
        routes: {
          dashboard: '仪表板',
          settings: '设置',
        },
      },
    },
  },
  pages: {
    taskpane: {
      DashboardPage: {
        labels: {},
      },
      SettingsPage: {
        labels: {
          developerOptions: '开发者选项',
        },
      },
    },
  },
}
