declare module "jsonwebtoken" {
    export function sign(
      payload: string | object | Buffer,
      secretOrPrivateKey: string | Buffer,
      options?: {
        algorithm?: string
        expiresIn?: string | number
        notBefore?: string | number
        audience?: string | string[]
        subject?: string
        issuer?: string
        jwtid?: string
        keyid?: string
        mutatePayload?: boolean
        noTimestamp?: boolean
        header?: object
        encoding?: string
      },
    ): string
  
    export function verify(token: string, secretOrPublicKey: string | Buffer, options?: object): object | string
  
    export function decode(
      token: string,
      options?: { complete?: boolean; json?: boolean },
    ): null | { [key: string]: any } | string
  }
  