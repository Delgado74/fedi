# Issue: Tasa CUP/USD incorrecta en Fedi (muestra 24 en lugar de ~350-531)

## Descripción
La tasa de cambio CUP/USD mostrada en la aplicación de Fedi es incorrecta. El servicio de *price feed* interno de Fedi (`price-feed.dev.fedibtc.com/latest`) devuelve un valor que implica **24 CUP = 1 USD**, pero el valor real de mercado (verificado directamente en Yadio.io) es de **~350-531 CUP = 1 USD**.

## Evidencia
1.  **Consulta al price feed de Fedi**:
    ```bash
    curl -s "https://price-feed.dev.fedibtc.com/latest" | grep "CUP/USD"
    # Resultado: "CUP/USD":{"rate":0.041666666666666664,"timestamp":"2026-04-28T20:25:01Z"}
    # 0.041666 equivale a 1/24 → 24 CUP por USD
    ```

2.  **Consulta directa a Yadio.io** (fuente que Fedi usa para otras tasas):
    ```bash
    curl -s "https://api.yadio.io/convert/1/USD/CUP"
    # Resultado: {"request":{"amount":1,"from":"USD","to":"CUP"},"result":531,"rate":531}
    # 531 CUP por USD (tasa de mercado real)
    ```

3.  **Código relacionado**:
    - Fedi consulta el price feed en `ui/common/redux/currency.ts:218`:
      ```typescript
      const response = await fetch('https://price-feed.dev.fedibtc.com/latest')
      ```
    - Para BTC/USD, Fedi usa Yadio.io directamente en `modules/stability-pool/server/src/oracle.rs:97`:
      ```rust
      "https://api.yadio.io/convert/1/BTC/USD"
      ```

## Causa del problema
Fedi no consulta Yadio.io directamente para las tasas de monedas fiduciarias (como CUP), sino que usa un servicio intermedio (`price-feed.dev.fedibtc.com`) que está sirviendo datos obsoletos para CUP. El valor de 24 CUP/USD corresponde a la tasa oficial histórica de Cuba, no a la tasa de mercado actual que Yadio.io sí devuelve correctamente cuando se consulta de forma directa.

## Soluciones propuestas
1.  **Opción recomendada**: Consultar Yadio.io directamente para las tasas de monedas fiduciarias, igual que se hace para BTC/USD en el Stability Pool.
2.  **Opción alternativa**: Corregir el servicio `price-feed.dev.fedibtc.com` para que use las tasas actualizadas de Yadio.io para CUP.
3.  **Opción de respaldo**: Agregar una validación de rangos en la app para detectar tasas atípicas y usar un *fallback* a Yadio.io directo en caso de anomalías.

## Archivos relevantes
- `ui/common/redux/currency.ts` (líneas 214-242): Lógica de consulta del price feed y mapeo de tasas fiduciarias.
- `modules/stability-pool/server/src/oracle.rs` (líneas 96-99): Ejemplo de consulta directa a Yadio.io para BTC/USD.

## Pasos para reproducir
1.  Abrir la aplicación de Fedi.
2.  Cambiar la moneda de preferencia a **CUP** (Peso Cubano).
3.  Ir a *Configuración > Configuración de desarrollador*.
4.  Verificar el valor de `CUP/USD (API)`: mostrará `0.041666` (equivalente a 24 CUP/USD), cuando el valor correcto debería ser `~0.001883` (equivalente a ~531 CUP/USD).
