CREATE TABLE [User]
(
    [UserId] INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    [Username] NVARCHAR(120) NOT NULL,
    [Password] NVARCHAR(120) NOT NULL,
    CONSTRAINT name_unique UNIQUE (Username)
);

CREATE TABLE [Gpsdata]
(
    [GpsdataId] INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    [Latitude] FLOAT  NOT NULL,
    [Longitude] FLOAT  NOT NULL,
    [Altitude] FLOAT  NOT NULL,
    [SentTime] INTEGER  NOT NULL,
    [ReceiveTime] INTEGER  NOT NULL,
    [UserId] INTEGER  NOT NULL,
    FOREIGN KEY ([UserId]) REFERENCES [User] ([UserId])
		ON DELETE NO ACTION ON UPDATE NO ACTION
);
