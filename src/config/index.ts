// TODO: 根据模块拆分不同的常量
/**
 * 加盐轮数
 */
export const SALT_ROUNDS = 10;

/**
 * 验证码过期时间
 */
export const CAPTCHA_EXPIRE_TIME = 5 * 60;

/**
 * 验证码开始下标
 */
export const CAPTCHA_BEGIN_INDEX = 2;

/**
 * 验证码结束下标
 */
export const CAPTCHA_END_INDEX = 8;

/**
 * 验证码发送类型
 */
export enum CAPTCHA_KEY {
  user_register = 'captcha_user_register_',
  update_password = 'captcha_update_password_',
  update_userinfo = 'captcha_update_userinfo_',
}

/**
 * 用户状态(是否被冻结)
 */
export const USER_FREEZE_STATUS = {
  UnFrozen: false,
  Frozen: true,
};
