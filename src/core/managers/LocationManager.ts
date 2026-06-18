import type { Location, LocationId, LocationCondition, LocationNotification } from '../../types/location';

/**
 * LocationManager owns all location data access and mutations.
 * Screens should call these methods instead of manipulating locations directly.
 * Logic migration from services/locationService.ts planned for Alpha 0.3.
 */
export class LocationManager {
  private locations: Location[];

  constructor(locations: Location[]) {
    this.locations = locations.map(l => ({ ...l }));
  }

  getLocations(): Location[] {
    return this.locations;
  }

  getLocationById(id: LocationId): Location | undefined {
    return this.locations.find(l => l.id === id);
  }

  updateCondition(id: LocationId, condition: LocationCondition): Location[] {
    this.locations = this.locations.map(l =>
      l.id === id ? { ...l, condition } : l,
    );
    return this.locations;
  }

  addNotification(id: LocationId, notification: LocationNotification): Location[] {
    this.locations = this.locations.map(l =>
      l.id === id && !l.notifications.includes(notification)
        ? { ...l, notifications: [...l.notifications, notification] }
        : l,
    );
    return this.locations;
  }

  clearNotification(id: LocationId, notification: LocationNotification): Location[] {
    this.locations = this.locations.map(l =>
      l.id === id
        ? { ...l, notifications: l.notifications.filter(n => n !== notification) }
        : l,
    );
    return this.locations;
  }

  updateOccupation(id: LocationId, count: number): Location[] {
    this.locations = this.locations.map(l =>
      l.id === id ? { ...l, currentOccupation: count } : l,
    );
    return this.locations;
  }
}
