import { Localization } from 'src/app/common/localization/localization';
import { ReportSelector_ } from '../report.model';

export class ReportSelectorBuilder {
	private captions: any = this.localize.captions;
	constructor(private localize: Localization) {
		this.captions = localize.captions;
	}
	private readonly reportSelector: ReportSelector_[] = [
		
	];

	public getReportSelections(group): ReportSelector_[] {
		return this.reportSelector.filter((o) => o.group === group).sort((a, b) => a.value.localeCompare(b.value));
	}
}
