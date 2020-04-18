import Postmark from './Postmark';

jest.mock('postmark');

describe('Postmark', () => {
	const PostmarkMock = jest.requireMock('postmark').ServerClient;

	beforeEach(() => {
		PostmarkMock.ClientSpy.mockClear();
		PostmarkMock.SendSpy.mockClear();
	});

	it('Should call the send message', () => {
		const transporter = new Postmark({ api_key: 'mockApiKey' });

		transporter.send({
			from: 'george',
			to: 'george',
			html: '<div>Test</div>',
			text: 'test',
			subject: 'test'
		});

		expect(PostmarkMock.SendSpy).toHaveBeenNthCalledWith(1, {
			From: 'george',
			To: 'george',
			HtmlBody: '<div>Test</div>',
			TextBody: 'test',
			Subject: 'test'
		});
		expect(PostmarkMock.ClientSpy).toHaveBeenNthCalledWith(1, 'mockApiKey');
	});

	it('Should return postmark', () => {
		const transporter = new Postmark({ api_key: 'mockApiKey' });

		expect(transporter.get()).toBeInstanceOf(PostmarkMock);
	});
});