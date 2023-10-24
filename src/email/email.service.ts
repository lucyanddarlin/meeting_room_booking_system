import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = createTransport({
      host: configService.get('nodeemailer_host'),
      port: configService.get('nodeemailer_port'),
      secure: false,
      auth: {
        user: configService.get('nodeemailer_auth_user'),
        pass: configService.get('nodeemailer_auth_pass'),
      },
    });
  }

  /**
   * 发送验证码
   */
  async sendCaptcha({ to, subject, html }: any) {
    await this.transporter.sendMail({
      from: {
        name: '会议室预订系统',
        address: this.configService.get('nodeemailer_auth_user'),
      },
      to,
      subject,
      html,
    });
  }
}
