import axios from 'axios'
import { DateTime } from 'luxon'

import type { ReportSkuDto } from './types'

import PackageJson from 'app/package.json'
import { useSettingsStore } from 'stores/settings'
import { sleep } from 'src/utils/common'

const _reportSku = async (data: ReportSkuDto[]) => {
  try {
    console.debug(
      data
        .map(
          (item) =>
            `SKU 上报: ${item.extra} ${item.subType} ${item.type}.${item.product}.${item.firstClass}.${item.secondClass}.${item.skuName} [${item.count}]`,
        )
        .join('\n'),
    )
    await axios.post('/kong/RdTestResourceStatistic/report/summary', data, {
      baseURL: useSettingsStore().baseUrl,
    })
    return true
  } catch (e) {
    console.error('StatisticsReporter Failed', data, e)
    return false
  }
}

const _pseudoReportSku = async (data: ReportSkuDto[]) => {
  console.debug(
    data
      .map(
        (item) =>
          `SKU 上报: ${item.extra} ${item.subType} ${item.type}.${item.product}.${item.firstClass}.${item.secondClass}.${item.skuName} [${item.count}]`,
      )
      .join('\n'),
  )
  await sleep(300 + Math.random() * 700)
  return true
}

export const acceptSku = async (
  begin: DateTime,
  count: number | undefined,
  modelName: string,
  projectId: string,
): Promise<boolean> => {
  const data: ReportSkuDto = {
    begin: Math.floor(begin.toMillis() / 1000),
    end: Math.floor(DateTime.now().toMillis() / 1000),
    count: count ?? 0,
    type: 'AIGC',
    product: 'WORD',
    firstClass: 'CODE',
    secondClass: modelName,
    skuName: 'KEEP',
    user: useSettingsStore().username,
    userType: 'USER',
    extra: PackageJson.version,
    subType: projectId,
  }
  return await (process.env.DEV ? _reportSku([data]) : _pseudoReportSku([data]))
}

export const generateSku = async (
  begin: DateTime,
  count: number | undefined,
  modelName: string,
  projectId: string,
): Promise<boolean> => {
  const data: ReportSkuDto = {
    begin: Math.floor(begin.toMillis() / 1000),
    end: Math.floor(DateTime.now().toMillis() / 1000),
    count: count ?? 0,
    type: 'AIGC',
    product: 'WORD',
    firstClass: 'CODE',
    secondClass: modelName,
    skuName: 'GENE',
    user: useSettingsStore().username,
    userType: 'USER',
    extra: PackageJson.version,
    subType: projectId,
  }
  return await (process.env.DEV ? _reportSku([data]) : _pseudoReportSku([data]))
}
