export default {
  components: {
    DashboardCards: {
      CompletionCard: {
        labels: {
          title: 'Completion',
          generate: 'Generate',
          insertCompletion: 'Insert Completion',
          noData: 'Edit document or click "Generate" to get completion',
          noNeedToComplete: 'No need to complete',
        },
      },
    },
    SettingsCards: {
      developer: {
        GeneralCard: {
          labels: {
            title: 'General',
            developerMode: 'Developer Mode',
          },
        },
        RequestTestCard: {
          labels: {
            title: 'Request Test',
            contextPrefix: 'Context Prefix',
            contextSuffix: 'Context Suffix',
            sendRequest: 'Send Request',
          },
        },
      },
      main: {
        AboutCard: {
          labels: {
            title: 'About',
            developerOptions: 'Developer Options',
            environment: 'Environment',
            version: 'Version',
          },
          notifications: {
            copySuccess: 'Office info copied to clipboard',
            copyFailure: 'Failed to copy Office info to clipboard',
            developerModeHint: 'Click {times} more times to enable developer mode',
            developerModeEnabled: 'Developer mode enabled',
          },
        },
        CompletionCard: {
          labels: {
            title: 'Completion',
            serviceUrl: 'Service URL',
            apiToken: 'API Token',
            model: 'Model',
            staticRanges: 'Static Cells',
          },
        },
        GeneralCard: {
          labels: {
            title: 'General',
            language: 'Language',
            theme: 'Display Theme',
          },
          languages: {
            'zh-CN': 'Chinese Simplified',
            'en-US': 'English (US)',
          },
        },
      },
    },
    ThemeButton: {
      labels: {
        switchTheme: 'Switch Theme',
      },
    },
  },
  layouts: {
    headers: {
      TaskpaneHeader: {
        routes: {
          dashboard: 'Dashboard',
          settings: 'Settings',
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
          developerOptions: 'Developer Options',
        },
      },
    },
  },
};
