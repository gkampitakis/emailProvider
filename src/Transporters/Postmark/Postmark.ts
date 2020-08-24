import { File, Transporter } from '../Transporter';
import { fromFile } from 'file-type';
import { ServerClient } from 'postmark';
import PromiseUtil from '@gkampitakis/promise-util';
import fs from 'fs';
import { ClientOptions } from 'postmark/dist/client/models';

export default class Postmark extends Transporter {
	private client;
	constructor(configuration: { serverToken: string; configOptions?: ClientOptions.Configuration }) {
		super(configuration);
		const { serverToken, configOptions } = configuration;
		this.client = new ServerClient(serverToken, configOptions);
	}

	public async send(message: any): Promise<any> {
		return this.client.sendEmail(await this.messageTransform(message));
	}

	public get(): any {
		return this.client;
	}

	protected async messageTransform(message: any): Promise<Record<string, any>> {
		const { from, to, subject, text, html, attachments = [], bcc = [], cc = [], ...rest } = message,
			To = to.join(','),
			Cc = cc.join(','),
			Bcc = bcc.join(',');

		const _attachments = await this.processAttachments(attachments);

		return {
			From: from,
			To,
			...(Bcc && { Bcc }),
			...(Cc && { Cc }),
			...(subject && { Subject: subject }),
			...(text && { TextBody: text }),
			...(html && { HtmlBody: html }),
			...(attachments.length && { attachments: _attachments }),
			...rest
		};
	}

	protected processAttachments(files: File[]): Promise<{ Name: string; Content: string; ContentType: string }> {
		return PromiseUtil.map(files, async (file: File) => {
			const result = await fromFile(file.path),
				Content = fs.readFileSync(file.path).toString('base64');

			return {
				ContentType: result?.mime,
				Name: file.name,
				Content
			};
		});
	}
}
