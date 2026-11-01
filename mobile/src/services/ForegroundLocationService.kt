package com.ghartak.safety

import android.app.*
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.google.android.gms.location.*

/**
 * GharTak Foreground Location Service
 * Runs with high reliability in background with persistent notification:
 * "GharTak: location share ho rahi hai" and a Stop action.
 */
class ForegroundLocationService : Service() {

    companion object {
        const val CHANNEL_ID = "ghartak_location_sharing"
        const val NOTIFICATION_ID = 1001
        const val ACTION_STOP_SHARING = "com.ghartak.safety.STOP_SHARING"
    }

    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var locationCallback: LocationCallback

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)

        locationCallback = object : LocationCallback() {
            override fun onLocationResult(locationResult: LocationResult) {
                for (location in locationResult.locations) {
                    // Send location update to React Native bridge and local queue
                    LocationBridge.emitLocation(location.latitude, location.longitude, location.accuracy)
                }
            }
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_STOP_SHARING) {
            stopForeground(STOP_FOREGROUND_REMOVE)
            stopSelf()
            return START_NOT_STICKY
        }

        val notification = createNotification()
        startForeground(NOTIFICATION_ID, notification)
        requestLocationUpdates()

        return START_STICKY
    }

    private fun requestLocationUpdates() {
        val locationRequest = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 10000)
            .setMinUpdateIntervalMillis(5000)
            .setMinUpdateDistanceMeters(10f)
            .build()

        try {
            fusedLocationClient.requestLocationUpdates(locationRequest, locationCallback, null)
        } catch (unlikely: SecurityException) {
            // Permission denied
        }
    }

    private fun createNotification(): Notification {
        val stopIntent = Intent(this, ForegroundLocationService::class.java).apply {
            action = ACTION_STOP_SHARING
        }
        val stopPendingIntent = PendingIntent.getService(
            this, 0, stopIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("GharTak")
            .setContentText("GharTak: location share ho rahi hai")
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setOngoing(true)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Sharing rokein", stopPendingIntent)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "GharTak Live Location Sharing",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Shows persistent status while live location is shared with trusted contacts"
            }
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        fusedLocationClient.removeLocationUpdates(locationCallback)
    }
}

object LocationBridge {
    fun emitLocation(lat: Double, lng: Double, accuracy: Float) {
        // Native to JS bridge emitter
    }
}
