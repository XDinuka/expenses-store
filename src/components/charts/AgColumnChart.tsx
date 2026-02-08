'use client';

import React, {useMemo} from 'react';
import {AgCharts} from 'ag-charts-react';
import {AllCommunityModule, ModuleRegistry} from 'ag-charts-community';

ModuleRegistry.registerModules([AllCommunityModule]);

interface DataPoint {
    label: string;
    value: number;
}

interface ChartProps {
    data: DataPoint[];
    height?: number;
    currencyPrefix?: string;
}

const AgColumnChart = ({
                           data,
                           height = 350,
                           currencyPrefix = 'LKR'
                       }: ChartProps) => {
    const options: any = useMemo(() => ({
        data: data,
        height: height,
        series: [
            {
                type: 'bar',
                xKey: 'label',
                yKey: 'value',
                yName: 'Amount',
                fill: '#001529',
                strokeWidth: 0,
                cornerRadius: 4,
                tooltip: {
                    renderer: (params: any) => {
                        return {
                            content: `${currencyPrefix} ${params.datum[params.yKey].toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}`,
                            title: params.datum[params.xKey],
                            backgroundColor: '#001529',
                            color: 'white',
                        };
                    },
                },
            },
        ],
        axes: [
            {
                type: 'category',
                position: 'bottom',
                label: {
                    fontSize: 10,
                    color: '#001529',
                },
                line: {
                    stroke: '#001529',
                },
                tick: {
                    stroke: '#001529',
                },
            },
            {
                type: 'number',
                position: 'left',
                label: {
                    fontSize: 10,
                    color: '#001529',
                    formatter: (params: any) => `${params.value}`,
                },
                line: {
                    stroke: '#001529',
                },
                tick: {
                    stroke: '#001529',
                },
                gridLine: {
                    style: [
                        {
                            stroke: '#e0e0e0',
                            lineDash: [2, 2],
                        },
                    ],
                },
            },
        ],
        background: {
            fill: 'transparent',
        },
        padding: {
            top: 40,
            right: 30,
            bottom: 60,
            left: 80,
        },
    }), [data, height, currencyPrefix]);

    return (
        <div style={{width: '100%', height: height}}>
            <AgCharts options={options}/>
        </div>
    );
};

export default AgColumnChart;
