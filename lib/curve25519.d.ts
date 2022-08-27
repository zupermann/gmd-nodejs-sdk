export namespace curve25519 {
    export { sign };
    export { verify };
    export { keygen };
}
/********* DIGITAL SIGNATURES *********/
declare function sign(h: any, x: any, s: any): any[] | undefined;
declare function verify(v: any, h: any, P: any): any[];
declare function keygen(k: any): {
    p: any[];
    s: any[];
    k: any;
};
export {};
//# sourceMappingURL=curve25519.d.ts.map