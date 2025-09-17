import axios from 'axios';
import { DateTime } from 'luxon';

import PackageJson from 'app/package.json';
import { officeHelper } from 'boot/office';
import { useSettingsStore } from 'stores/settings';
import { sleep } from 'src/utils/common';

import { SERVICE_BASE_URL_MAP } from './constants';
import type { ReportSkuDto } from './types';

const _reportSku = async (data: ReportSkuDto[]) => {
  try {
    console.debug(
      data
        .map(
          (item) =>
            `SKU 上报: ${item.extra} ${item.subType} ${item.type}.${item.product}.${item.firstClass}.${item.secondClass}.${item.skuName} [${item.count}]`,
        )
        .join('\n'),
    );
    const baseUrl = SERVICE_BASE_URL_MAP[useSettingsStore().networkZone];
    if (!baseUrl.length) {
      await sleep(200 + Math.random() * 300);
    } else {
      await axios.post('/kong/RdTestResourceStatistic/report/summary', data, {
        baseURL: baseUrl,
      });
    }
    return true;
  } catch (e) {
    console.error('StatisticsReporter Failed', data, e);
    return false;
  }
};

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
    product: 'EXCEL',
    firstClass: 'CODE',
    secondClass: modelName,
    skuName: 'KEEP',
    user: await officeHelper.retrieveUserId(),
    userType: 'USER',
    extra: PackageJson.version,
    subType: projectId,
  };
  return await _reportSku([data]);
};

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
    product: 'EXCEL',
    firstClass: 'CODE',
    secondClass: modelName,
    skuName: 'GENE',
    user: await officeHelper.retrieveUserId(),
    userType: 'USER',
    extra: PackageJson.version,
    subType: projectId,
  };
  return await _reportSku([data]);
};

export const timeSku = async (
  count: number | undefined,
  skuName: 'ACTIVE' | 'USE',
): Promise<boolean> => {
  const currentTimestamp = DateTime.now();
  const data: ReportSkuDto = {
    begin: Math.floor(currentTimestamp.toMillis() / 1000),
    end: Math.floor(currentTimestamp.toMillis() / 1000),
    count: count ?? 0,
    type: 'AIGC',
    product: 'EXCEL',
    firstClass: 'TIME',
    secondClass: 'CMW',
    skuName,
    user: await officeHelper.retrieveUserId(),
    userType: 'USER',
    extra: PackageJson.version,
    subType: await officeHelper.retrieveProjectId(),
  };
  return await _reportSku([data]);
};
