// Basic usage example for MyPackage.
//
// This example demonstrates the basic functionality of the package.
//
// To run this example:
//   1. Add it to a console project that references MyPackage
//   2. Run: dotnet run
//
// Or use the following command from the repository root:
//   dotnet run --project examples/BasicUsage

using MyPackage;

Console.WriteLine($"MyPackage v{PackageInfo.Version}");
Console.WriteLine();

// Example 1: Basic arithmetic
Console.WriteLine("Example 1: Basic arithmetic");
Console.WriteLine($"2 + 3 = {Calculator.Add(2, 3)}");
Console.WriteLine($"2 * 3 = {Calculator.Multiply(2, 3)}");
Console.WriteLine();

// Example 2: Working with larger numbers
Console.WriteLine("Example 2: Working with larger numbers");
Console.WriteLine($"1000 + 2000 = {Calculator.Add(1000, 2000)}");
Console.WriteLine($"100 * 200 = {Calculator.Multiply(100, 200)}");
Console.WriteLine();

// Example 3: Working with negative numbers
Console.WriteLine("Example 3: Working with negative numbers");
Console.WriteLine($"-5 + 10 = {Calculator.Add(-5, 10)}");
Console.WriteLine($"-3 * 4 = {Calculator.Multiply(-3, 4)}");
Console.WriteLine();

// Example 4: Async delay
Console.WriteLine("Example 4: Async delay");
Console.WriteLine("Waiting for 1 second...");
await Calculator.DelayAsync(1.0);
Console.WriteLine("Done!");
