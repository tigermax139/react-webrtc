export const RTCErrorCodes =  {
  USER_MEDIA_NOT_ALLOWED: 'USER_MEDIA_NOT_ALLOWED',
};

export class RTCError extends Error {
  constructor({ message, code } = {}){
    if (!code || !RTCErrorCodes[code]) {
      throw new Error('Invalid error code')
    }
    // eslint-disable-next-line no-param-reassign
    message = message || RTCErrorCodes[code];
    super(message);
    this.name = 'RTCError';
    this.code = code;
  }
}