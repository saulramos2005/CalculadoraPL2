export function convertir_a_Fraccion(decimal: number): string {
    if (Number.isInteger(decimal)) return `${decimal}`;

    const EPSILON = 1e-10;
    let n = decimal;
    let signo = n < 0 ? "-" : "";
    n = Math.abs(n);

    let h1 = 1, h2 = 0;
    let k1 = 0, k2 = 1;
    let b = n;

    do {
        let a = Math.floor(b);
        let auxH = h1; h1 = a * h1 + h2; h2 = auxH;
        let auxK = k1; k1 = a * k1 + k2; k2 = auxK;
        b = 1 / (b - a);
    } while (Math.abs(n - h1 / k1) > n * EPSILON);

    return `${signo}${h1}/${k1}`;
}