# FIFA 3D — Antigravity Edition ⚽

Juego de fútbol 3D construido con Three.js — 11 vs 11 con IA, físicas de balón y múltiples cámaras.

## Características

- 🎮 Control de jugador con WASD + Sprint
- ⚽ Físicas de balón realistas (gravedad, rebote, fricción)
- 🤖 IA para aliados y CPU (formación 4-3-3)
- 📷 4 modos de cámara (Broadcast, Jugador, Lateral, Táctica)
- 🏟️ Estadio con gradas escalonadas y público instanciado animado
- 🗺️ Minimapa táctico en tiempo real
- 🎨 Modelos 3D Mixamo con animaciones (idle, correr, patear)

## Controles

| Tecla | Acción |
|-------|--------|
| W/A/S/D | Mover |
| SHIFT | Sprint |
| ESPACIO | Disparo |
| J | Pase |
| K | Tackle / Cambiar jugador |
| 1-4 | Cambiar cámara |

## Cómo ejecutar

```bash
cd public
python3 -m http.server 8081
```

Luego abre `http://localhost:8081` en tu navegador.

## Estructura

```
public/
├── index.html
├── css/styles.css
├── js/
│   ├── main.js         # Game loop
│   ├── config.js       # Constantes
│   ├── scene.js        # Escena Three.js
│   ├── lighting.js     # Iluminación
│   ├── pitch.js        # Campo
│   ├── goal.js         # Porterías
│   ├── ball.js         # Balón + físicas
│   ├── player.js       # Jugadores
│   ├── team.js         # Equipos + modelos
│   ├── ai.js           # IA
│   ├── camera.js       # Cámaras
│   ├── input.js        # Controles
│   ├── hud.js          # Marcador
│   ├── minimap.js      # Minimapa
│   └── stadium.js      # Estadio
└── assets/models/      # Modelos GLTF (no incluidos)
```

## Tecnologías

- [Three.js](https://threejs.org/) v0.160.0
- ES Modules nativos
- Modelos [Mixamo](https://www.mixamo.com/)
