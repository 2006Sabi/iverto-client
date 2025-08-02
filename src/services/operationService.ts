import { store } from '@/store';
import { config } from '@/config/environment';
import {
  addCamera,
  updateCamera,
  removeCamera,
  addAnomaly,
  updateAnomaly,
  removeAnomaly,
} from '@/store/slices/dataSlice';
import { dataInitializer } from '@/services/dataInitializer';

class OperationService {
  private static instance: OperationService;
  private token: string | null = null;

  private constructor() {
    this.token = localStorage.getItem('token');
  }

  public static getInstance(): OperationService {
    if (!OperationService.instance) {
      OperationService.instance = new OperationService();
    }
    return OperationService.instance;
  }

  private async makeApiRequest(url: string, options: RequestInit = {}): Promise<any> {
    // Refresh token from localStorage if missing
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    if (!this.token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Camera Operations
  async addCamera(cameraData: any): Promise<any> {
    try {
      const response = await this.makeApiRequest(`${config.apiUrl}/cameras`, {
        method: 'POST',
        body: JSON.stringify({ ...cameraData, httpUrl: cameraData.httpUrl }), // Ensure httpUrl is sent
      });

      if (response.success && response.data) {
        // Immediately update Redux store
        store.dispatch(addCamera(response.data));
        await dataInitializer.refreshAllData();
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateCamera(cameraId: string, cameraData: any): Promise<any> {
    try {
      const response = await this.makeApiRequest(`${config.apiUrl}/cameras/${cameraId}`, {
        method: 'PUT',
        body: JSON.stringify({ ...cameraData, httpUrl: cameraData.httpUrl }), // Ensure httpUrl is sent
      });

      if (response.success && response.data) {
        // Immediately update Redux store
        store.dispatch(updateCamera(response.data));
        await dataInitializer.refreshAllData();
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  async deleteCamera(cameraId: string): Promise<any> {
    try {
      const response = await this.makeApiRequest(`${config.apiUrl}/cameras/${cameraId}`, {
        method: 'DELETE',
      });

      if (response.success) {
        // Immediately update Redux store
        store.dispatch(removeCamera(cameraId));
        await dataInitializer.refreshAllData();
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Anomaly Operations
  async updateAnomaly(anomalyId: string, anomalyData: any): Promise<any> {
    try {
      const response = await this.makeApiRequest(`${config.apiUrl}/anomalies/${anomalyId}`, {
        method: 'PUT',
        body: JSON.stringify(anomalyData),
      });

      if (response.success && response.data) {
        // Immediately update Redux store
        store.dispatch(updateAnomaly(response.data));
        await dataInitializer.refreshAllData();
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  async deleteAnomaly(anomalyId: string): Promise<any> {
    try {
      const response = await this.makeApiRequest(`${config.apiUrl}/anomalies/${anomalyId}`, {
        method: 'DELETE',
      });

      if (response.success) {
        // Immediately update Redux store
        store.dispatch(removeAnomaly(anomalyId));
        await dataInitializer.refreshAllData();
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  // WebSocket event handlers for real-time updates
  handleCameraAdded(cameraData: any): void {
    store.dispatch(addCamera(cameraData));
  }

  handleCameraUpdated(cameraData: any): void {
    store.dispatch(updateCamera(cameraData));
  }

  handleCameraDeleted(cameraId: string): void {
    store.dispatch(removeCamera(cameraId));
  }

  handleAnomalyAdded(anomalyData: any): void {
    store.dispatch(addAnomaly(anomalyData));
  }

  handleAnomalyUpdated(anomalyData: any): void {
    store.dispatch(updateAnomaly(anomalyData));
  }

  handleAnomalyDeleted(anomalyId: string): void {
    store.dispatch(removeAnomaly(anomalyId));
  }

  // Update token when it changes
  updateToken(newToken: string): void {
    this.token = newToken;
  }
}

export default OperationService; 