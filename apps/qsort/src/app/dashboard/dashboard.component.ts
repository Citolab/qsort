import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BackendService } from '../shared/services/backend.service';
import { fadeInOnEnterAnimation, fadeOutOnLeaveAnimation } from 'angular-animations';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { Label, PluginServiceGlobalRegistrationAndOptions } from 'ng2-charts';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getUnique, baseUrl } from '../shared/utils';
import { StatementWithResponseAndImage } from '../shared/model/model';
import { environment } from '../../environments/environment';

class StatementForUser extends StatementWithResponseAndImage {
    user: string
}

@Component({
    selector: 'qsort-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        fadeInOnEnterAnimation(),
        fadeOutOnLeaveAnimation()
    ]
})
export class DashboardComponent {
    public barChartOptions: ChartOptions = {
        responsive: true,
        // We use these empty structures as placeholders for dynamic theming.
        scales: { xAxes: [{}], yAxes: [{}] },
        tooltips: {
            displayColors: false,
            callbacks: {
                //   title: (tooltip => {
                //     console.log(tooltip);
                //     return `yes!`;
                //   }),
            
                // custom: (tooltip) =>  {
                //     // disable displaying the color box;
                //     tooltip?.displayColors = false;
                //     return tooltip;
                // },
                label: ((tooltip: any) => {
                    const statements = this.statements.filter(s => s.title === tooltip.label);
                    const statementPerCategory = statements.filter(s => {
                        if (tooltip.datasetIndex === 0 && s.value === '0_0' ||
                            tooltip.datasetIndex === 1 && s.value === '6_0') {
                            return true;
                        }
                        return false;
                    })
                    const users = getUnique(statementPerCategory.map(s => s.user));
                    return [statements[0].text, ' ', 'Gebruikers:', ...users];
                })
            }
        },
        plugins: {
            datalabels: {
                anchor: 'end',
                align: 'end',
            }
        }
    };
    public barChartType: ChartType = 'bar';
    public barChartLegend = true;
    public barChartPlugins= [pluginDataLabels as any];
    statements: StatementForUser[] = [];
    data$: Observable<{ labels: Label[], data: ChartDataSets[] }>;

    constructor(backendService: BackendService) {
        this.data$ = backendService.getExtremeValues().pipe(map(extremeValues => {
            const labels = getUnique([...extremeValues.map(e => e.left.title), ...extremeValues.map(e => e.right.title)]);
            const leftSet = labels.map(label => extremeValues.filter(v => v.left.title === label).length);
            const rightSet = labels.map(label => extremeValues.filter(v => v.right.title === label).length);
            const data = [
                { data: leftSet, label: environment.categories[0], backgroundColor: '#f626f0' },
                { data: rightSet, label: environment.categories[1], backgroundColor: '#f5ec33' }
            ];
            extremeValues.forEach(v => {
                this.statements = [...this.statements, { ...v.right, user: v.user }, { ...v.left, user: v.user }];
            });
            return { labels, data };
        }));

    }
    restart() {
        window.location.href = baseUrl(window.location.href);
    }

}
