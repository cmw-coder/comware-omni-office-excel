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
          completionStrategies: {
            general: '通用',
            testCase: '测试用例',
          },
          labels: {
            title: '关于',
            environment: '环境',
            completionStrategy: '补全策略',
            networkZone: '网络区域',
            publicNetwork: '无服务（公网）',
            version: '版本',
            developerOptions: '开发者选项',
          },
          networkZone: {
            Red: '红区',
            Yellow: '黄区',
            Route: '路由红区',
            Public: '公网',
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
            apiToken: 'API 令牌',
            model: '模型',
            privateModel: '私有模型',
            staticRanges: '静态单元格',
          },
          tooltips: {
            whyCannotEditModel: '模型只能在“网络区域”为“公网”时手动设置',
            whyCannotEditStaticRanges: '静态单元格只能在“补全策略”为“通用”时手动设置',
          },
        },
        GeneralCard: {
          labels: {
            title: '通用',
            language: '语言',
            theme: '显示主题',
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
        switchTheme: '切换主题',
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
};
