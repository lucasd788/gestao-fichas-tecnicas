export const arredondar = (valor: number): number => {
    if (!valor || valor <= 0) return 0;
    return Math.floor(valor / 5) * 5;
};