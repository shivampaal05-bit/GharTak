import express from 'express';
import cors from 'cors';
import http from 'http';
import { config } from './config';
import { initDb } from './db/database';
import { wsManager } from './services/websocket';
import { startScheduler } from './services/cleanup';

import { authRouter } from './routes/auth';
import { meRouter } from './routes/me';
import { contactsRouter } from './routes/contacts';
import { sharesRouter } from './routes/shares';
import { sosRouter } from './routes/sos';
import { placesRouter } from './routes/places';
import { publicViewRouter } from './routes/publicView';

export const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// Mount routers
app.use('/auth', authRouter);
app.use('/me', meRouter);
app.use('/contacts', contactsRouter);
app.use('/shares', sharesRouter);
app.use('/sos', sosRouter);
app.use('/places', placesRouter);
app.use('/v', publicViewRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'GharTak Backend',
    timestamp: new Date().toISOString(),
  });
});

export const server = http.createServer(app);

// Start server function
export async function startServer(port: number = config.port) {
  await initDb();
  wsManager.init(server);
  startScheduler();

  return new Promise<void>((resolve) => {
    server.listen(port, () => {
      console.log(`[GharTak Backend] Running on http://localhost:${port}`);
      resolve();
    });
  });
}

if (process.env.NODE_ENV !== 'test') {
  startServer().catch((err) => {
    console.error('Failed to start GharTak server:', err);
  });
}
