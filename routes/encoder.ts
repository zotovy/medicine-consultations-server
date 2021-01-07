export interface ObjectLiteral {
    [key: string]: any;
}

class Encoder {
    query = <T = any>(query: any, keys: string[]): T => {
        const final: T = {} as T;
        (keys as (keyof T)[]).forEach((key) => {
            try {
                if (query[key]) {
                    final[key] = JSON.parse(query[key]);
                }
            } catch (e) {
                console.log(e);
            }
        });

        return final;
    };
}

export default new Encoder();
