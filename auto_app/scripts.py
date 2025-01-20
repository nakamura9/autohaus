import csv
import os 
import pathlib
from dataclasses import dataclass

csv_path = pathlib.Path(__file__).parent.parent.absolute() / "all-vehicles-model.csv"
MAKE_COLUMN = 0
MODEL_COLUMN = 1
ENGINE = 25
DRIVE = 26
FUEL = 33
TRANSMISSION = 57
VEHICLE_SIZE = 62
YEAR = 63

@dataclass
class Make:
    name: str


@dataclass
class Model:
    make: Make
    name: str
    engine: str
    drive: str
    fuel: str
    transmission: str
    vehicle_size: str
    year: int



def clean(row):
    make = Make(name=row['make'].title().strip())
    drive = "front_wheel_drive"
    if any([i in row['drive'].lower() for i in ['4', 'all']]):
        drive = "all_wheel_drive"

    elif 'rear' in row['drive'].lower():
        drive = "rear_wheel_drive"

    fuel = "petrol"
    if 'diesel' in row['fuel'].lower():
        fuel = "diesel"

    if 'electricity' in row['fuel'].lower():
        fuel = "electric"

    transmission = "automatic"
    if 'manual' in row['transmission'].lower():
        transmission = "manual"

    model = Model(
        make=make,
        name=row['model'].title().strip(),
        engine=row['engine'].strip(),
        drive=drive,
        fuel=fuel,
        transmission=transmission,
        vehicle_size=row['vehicle_size'].strip(),
        year=int(row['year']),
    )
    return model

def db_insert(model: Model):
    from auto_app.models import Make as VehicleMake, Model as VehicleModel
    make, _ = VehicleMake.objects.get_or_create(name=model.make.name)
    VehicleModel.objects.create(
        make=make,
        name=model.name,
        engine=model.engine,
        drivetrain=model.drive,
        fuel_type=model.fuel,
        transmission=model.transmission,
        car_class=model.vehicle_size,
        year=model.year
    )


def update_year(index, year):
    from auto_app.models import Model as VehicleModel
    model = VehicleModel.objects.get(id=index)
    model.year = year
    model.save(update_fields=['year'])


print(csv_path.exists())
def main():
    if not csv_path.exists():
        print("CSV file not found")
        return

    with open(csv_path, 'r') as f:
        reader = csv.reader(f, delimiter=';', quotechar='"')
        next(reader)  # Skip the header row
        for idx, row in enumerate(reader, start=1):
            make = row[MAKE_COLUMN]
            if not make:
                break
            model = row[MODEL_COLUMN]
            engine = row[ENGINE]
            drive = row[DRIVE]
            fuel = row[FUEL]
            transmission = row[TRANSMISSION]
            vehicle_size = row[VEHICLE_SIZE]
            year = row[YEAR]
            print(f"{make} {model} {engine} {drive} {fuel} {transmission} {vehicle_size}")
            data = {
                'make': make,
                'model': model,
                'engine': engine,
                'drive': drive,
                'fuel': fuel,
                'transmission': transmission,
                'vehicle_size': vehicle_size,
                'year': year
            }

            cleaned_data: Model = clean(data)
            print(cleaned_data)

            # insert into db
            # db_insert(cleaned_data)
            update_year(idx, cleaned_data.year)


if __name__ == "__main__":
    main()
