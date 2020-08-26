export interface ObjectLiteral {
    [key: string]: any;
}

class Encoder {
    query = (query: any, keys: string[]): ObjectLiteral => {
        const final: ObjectLiteral = {};
        keys.forEach((key) => {
            try {
                if (query[key]) {
                    console.log(JSON.parse(query[key]));

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
